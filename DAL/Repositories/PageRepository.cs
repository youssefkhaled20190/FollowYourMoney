using DAL.Context;
using DAL.Interfaces;
using DAL.Model;

namespace DAL.Repositories
{
    public class PageRepository : GenericRepository<Page>, IPageRepository
    {
        public PageRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
