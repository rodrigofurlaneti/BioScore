namespace BioScore.Core.Modules.Exams.DTOs
{
    public class ExamUserView
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string ExamCategory { get; set; } = string.Empty;
        public string ExamName { get; set; } = string.Empty;
        public string? Abbreviation { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Result { get; set; }
    }
}
