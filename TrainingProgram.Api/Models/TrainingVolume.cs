using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class TrainingVolume
    {
        [Key]
        public int Id { get; set; }
        public int MacrocycleId { get; set; }
        [ForeignKey("MacrocycleId")]
        public Macrocycle Macrocycle { get; set; }

        public int TrainingTypeId { get; set; }
        [ForeignKey("TrainingTypeId")]
        public TrainingType TrainingType { get; set; }

        [Required]
        public int PlannedMinutes { get; set; }
        public int RealizedMinutes { get; set; }
    }
}