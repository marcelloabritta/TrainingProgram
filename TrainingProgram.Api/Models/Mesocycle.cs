using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class Mesocycle
    {
        [Key]
        public int Id { get; set; }
        
        public int MacrocycleId { get; set; }
        [ForeignKey("MacrocycleId")]
        public Macrocycle Macrocycle { get; set; }

        [Required]  
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        public int Order { get; set; } // Number of mesocycle   
        public ICollection<WeeklyMicrocycle> Weeks { get; set; } = new List<WeeklyMicrocycle>();
    }
}