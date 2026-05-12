using DAL.Context;
using DAL.Interfaces;
using DAL.Model;
namespace DAL.Repositories
{
    public class LogsRepository : GenericRepository<Logs>, ILogsRepository
    {
        public LogsRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
