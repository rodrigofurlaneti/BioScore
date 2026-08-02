namespace BioScore.Core.Modules.Exams.Entities
{
    public class Exam
    {
        public Guid Id { get; set; }
        public Guid ExamCategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Abbreviation { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public ExamCategory Category { get; set; } = null!;
    }
}
