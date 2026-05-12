namespace Shared.DTO
{
    public class DepartmentFilterDto
    {
        public int Id { get; set; } = -1;

        public void Normalize()
        {
            if (this.Id <= 0) this.Id = -1;
        }
    }
}
