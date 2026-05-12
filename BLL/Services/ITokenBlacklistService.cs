namespace BLL.Services
{
    public interface ITokenBlacklistService
    {
        Task RevokeAsync(string jti, DateTime expiresAt);
        Task<bool> IsRevokedAsync(string jti);
    }
}
