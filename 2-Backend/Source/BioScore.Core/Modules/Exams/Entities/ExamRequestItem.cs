namespace BioScore.Core.Modules.Exams.Entities
{
    public class ExamRequestItem
    {
        public Guid Id { get; set; }
        public Guid ExamRequestId { get; set; }
        public Guid ExamId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Result { get; set; }
        public string? Laboratory { get; set; }
        public string? Notes { get; set; }
    }
}
