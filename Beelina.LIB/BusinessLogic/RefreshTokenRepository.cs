using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class RefreshTokenRepository
        : BaseRepository<RefreshToken>, IRefreshTokenRepository<RefreshToken>
    {
        public RefreshTokenRepository(IBeelinaRepository<RefreshToken> reserbizRepository)
                    : base(reserbizRepository, reserbizRepository.ClientDbContext)
        {

        }
        public async Task<RefreshToken> GetRefreshToken(string refreshToken)
        {
            var refreshTokenFromRepo = await _beelinaRepository.ClientDbContext
                    .RefreshTokens
                    .FirstOrDefaultAsync(r => r.Token == refreshToken);

            return refreshTokenFromRepo;
        }
    }
}