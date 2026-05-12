namespace Shared.DTO
{
    public class ListFrameDto <FilterClass> where FilterClass : class
    {
        public FilterClass? Filter { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = string.Empty;
        public bool IsDescending { get; set; } = false;
        public List<int>? LoadOption { get; set; }
    }
}
