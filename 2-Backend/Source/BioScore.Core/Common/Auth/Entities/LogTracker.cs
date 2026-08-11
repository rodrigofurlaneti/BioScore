namespace BioScore.Core.Common.Auth.Entities
{
    public class LogTracker
    {
        public long Id { get; set; }
        public Guid? UserId { get; set; }
        public string? DirectoryName { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string MethodName { get; set; } = string.Empty;
        public bool IsSuccess { get; set; } = true;
        public long? ExecutionTimeMs { get; set; }
        public string? Message { get; set; }
        public string? ErrorMessage { get; set; }
        public string? StackTrace { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
        public virtual User? User { get; set; }
    }
}