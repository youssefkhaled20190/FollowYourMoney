namespace BLL.Services
{
    public class InMemoryTokenBlacklistService : ITokenBlacklistService
    {
        private readonly Dictionary<string, DateTime> _revoked = new();

        public Task RevokeAsync(string jti, DateTime expiresAt)
        {
            _revoked[jti] = expiresAt;
            return Task.CompletedTask;
        }

        public Task<bool> IsRevokedAsync(string jti)
        {
            if (_revoked.TryGetValue(jti, out var expiresAt))
            {
                if (expiresAt > DateTime.UtcNow)
                    return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
    }
}
