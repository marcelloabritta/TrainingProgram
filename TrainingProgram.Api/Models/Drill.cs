using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class Drill
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } // Ex: "Ball Control"
        [Required]
        public string Description { get; set; }
        [Required]
        public int Duration { get; set; }

        public int TrainingSessionId { get; set; }
        [ForeignKey("TrainingSessionId")]
        public TrainingSession TrainingSession { get; set; }
        
    }
}