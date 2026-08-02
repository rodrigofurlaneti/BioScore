namespace BioScore.Core.Modules.Exams.Entities
{
    public class ExamCategory
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public byte SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
