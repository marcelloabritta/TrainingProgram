using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class TrainingType
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } // "Tactical", "Technical/Individual", "Physical"
        public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();
    }
}