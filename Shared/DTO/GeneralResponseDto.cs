namespace Shared.DTO
{
    public class GeneralResponseDto
    {
        public Object? Data { get; set; }
        public bool Result { get; set; } = true;
        public string Message { get; set; } = string.Empty;
    }
}
