namespace BioScore.Core.Modules.Exams.Entities
{
    public class ExamRequest
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime RequestDate { get; set; }
        public string? DoctorName { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ICollection<ExamRequestItem> Items { get; set; } = new List<ExamRequestItem>();
    }
}
