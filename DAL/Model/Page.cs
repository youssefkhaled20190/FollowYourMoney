namespace DAL.Model
{
    public class Page
    {
        public int Id { get; set; }
        public string Path { get; set; } = string.Empty;
        public string Element { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;

        public ICollection<PageRole>? PageRoles { get; set; }
    }
}
