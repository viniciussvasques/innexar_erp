"""
QuickBooks Online API client
Handles OAuth 2.0 and API calls
"""
import requests
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

# QuickBooks API endpoints
QB_SANDBOX_BASE = 'https://sandbox-quickbooks.api.intuit.com'
QB_PRODUCTION_BASE = 'https://quickbooks.api.intuit.com'
QB_OAUTH_BASE = 'https://appcenter.intuit.com/connect/oauth2'
QB_DISCONNECT_BASE = 'https://appcenter.intuit.com/api/v1/connection/disconnect'


def get_quickbooks_oauth_url(state='default'):
    """
    Generate OAuth authorization URL for QuickBooks
    
    Returns:
        str: Authorization URL
    """
    client_id = getattr(settings, 'QUICKBOOKS_CLIENT_ID', '')
    redirect_uri = getattr(settings, 'QUICKBOOKS_REDIRECT_URI', '')
    scope = 'com.intuit.quickbooks.accounting'
    
    if not client_id or not redirect_uri:
        raise ValueError('QuickBooks OAuth credentials not configured')
    
    auth_url = (
        f"{QB_OAUTH_BASE}?"
        f"client_id={client_id}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"redirect_uri={redirect_uri}&"
        f"state={state}"
    )
    
    return auth_url


def exchange_code_for_tokens(code, realm_id):
    """
    Exchange authorization code for access and refresh tokens
    
    Args:
        code: Authorization code from OAuth callback
        realm_id: QuickBooks company ID
    
    Returns:
        dict: Tokens with access_token, refresh_token, expires_at
    """
    client_id = getattr(settings, 'QUICKBOOKS_CLIENT_ID', '')
    client_secret = getattr(settings, 'QUICKBOOKS_CLIENT_SECRET', '')
    redirect_uri = getattr(settings, 'QUICKBOOKS_REDIRECT_URI', '')
    
    if not all([client_id, client_secret, redirect_uri]):
        raise ValueError('QuickBooks OAuth credentials not configured')
    
    token_url = f"{QB_OAUTH_BASE}/token"
    
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
    }
    
    response = requests.post(
        token_url,
        data=data,
        auth=(client_id, client_secret),
        headers={'Accept': 'application/json'}
    )
    
    if response.status_code != 200:
        raise Exception(f'Failed to exchange code: {response.text}')
    
    token_data = response.json()
    
    expires_in = token_data.get('expires_in', 3600)
    expires_at = timezone.now() + timedelta(seconds=expires_in)
    
    return {
        'access_token': token_data['access_token'],
        'refresh_token': token_data['refresh_token'],
        'expires_at': expires_at,
        'realm_id': realm_id,
    }


def refresh_quickbooks_token(refresh_token):
    """
    Refresh QuickBooks access token using refresh token
    
    Args:
        refresh_token: OAuth refresh token
    
    Returns:
        dict: New tokens
    """
    client_id = getattr(settings, 'QUICKBOOKS_CLIENT_ID', '')
    client_secret = getattr(settings, 'QUICKBOOKS_CLIENT_SECRET', '')
    
    if not all([client_id, client_secret]):
        raise ValueError('QuickBooks OAuth credentials not configured')
    
    token_url = f"{QB_OAUTH_BASE}/token"
    
    data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
    }
    
    response = requests.post(
        token_url,
        data=data,
        auth=(client_id, client_secret),
        headers={'Accept': 'application/json'}
    )
    
    if response.status_code != 200:
        raise Exception(f'Failed to refresh token: {response.text}')
    
    token_data = response.json()
    
    expires_in = token_data.get('expires_in', 3600)
    expires_at = timezone.now() + timedelta(seconds=expires_in)
    
    return {
        'access_token': token_data['access_token'],
        'refresh_token': token_data.get('refresh_token', refresh_token),
        'expires_at': expires_at,
    }


class QuickBooksClient:
    """
    QuickBooks Online API client
    """
    
    def __init__(self, qb_integration):
        """
        Initialize QuickBooks client
        
        Args:
            qb_integration: QuickBooksIntegration instance
        """
        self.qb_integration = qb_integration
        self.realm_id = qb_integration.realm_id
        self.base_url = QB_SANDBOX_BASE if getattr(settings, 'QUICKBOOKS_SANDBOX', True) else QB_PRODUCTION_BASE
        self._ensure_valid_token()
    
    def _ensure_valid_token(self):
        """Ensure access token is valid, refresh if needed"""
        if self.qb_integration.is_token_expired():
            logger.info('QuickBooks token expired, refreshing...')
            tokens = refresh_quickbooks_token(self.qb_integration.refresh_token)
            self.qb_integration.access_token = tokens['access_token']
            self.qb_integration.refresh_token = tokens.get('refresh_token', self.qb_integration.refresh_token)
            self.qb_integration.token_expires_at = tokens.get('expires_at')
            self.qb_integration.save()
    
    def _get_headers(self):
        """Get API request headers"""
        return {
            'Authorization': f"Bearer {self.qb_integration.access_token}",
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    
    def _make_request(self, method, endpoint, data=None):
        """Make API request to QuickBooks"""
        url = f"{self.base_url}/v3/company/{self.realm_id}/{endpoint}"
        
        response = requests.request(
            method,
            url,
            headers=self._get_headers(),
            json=data
        )
        
        if response.status_code == 401:
            # Token expired, refresh and retry
            self._ensure_valid_token()
            response = requests.request(
                method,
                url,
                headers=self._get_headers(),
                json=data
            )
        
        response.raise_for_status()
        return response.json()
    
    def get_company_info(self):
        """Get QuickBooks company information"""
        try:
            result = self._make_request('GET', 'companyinfo')
            if result.get('QueryResponse'):
                return result['QueryResponse'].get('CompanyInfo', [{}])[0]
            return result.get('CompanyInfo', {})
        except Exception as e:
            logger.error(f'Error fetching company info: {e}')
            return None
    
    def sync_all(self):
        """Sync all enabled data types"""
        results = {}
        
        if self.qb_integration.sync_customers:
            results['customers'] = self.sync_customers()
        
        if self.qb_integration.sync_invoices:
            results['invoices'] = self.sync_invoices()
        
        if self.qb_integration.sync_items:
            results['items'] = self.sync_items()
        
        return results
    
    def sync_customers(self):
        """Sync customers from QuickBooks"""
        # TODO: Implement customer sync
        return {'synced': 0, 'message': 'Not implemented yet'}
    
    def sync_invoices(self):
        """Sync invoices from QuickBooks"""
        # TODO: Implement invoice sync
        return {'synced': 0, 'message': 'Not implemented yet'}
    
    def sync_items(self):
        """Sync items/products from QuickBooks"""
        # TODO: Implement item sync
        return {'synced': 0, 'message': 'Not implemented yet'}

