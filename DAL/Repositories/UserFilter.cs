using DAL.Model;

namespace DAL.Repositories
{
    public class UserFilter
    {
        public string UserId { get; set; } = string.Empty;

        public  IQueryable<User> GetWhereStatement(IQueryable<User> query)
        {
            if (string.IsNullOrEmpty(this.UserId))
            {
                query = query.Where(u => u.Id == this.UserId);
            }
            return query;
        }
    }
}
