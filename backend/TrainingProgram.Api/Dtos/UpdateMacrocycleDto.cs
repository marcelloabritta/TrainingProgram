using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Dtos
{
    public class UpdateMacrocycleDto
    {
        [Required]
        [Range(2020, 2099)]
        public int Year { get; set; }

        [Required]
        [MaxLength(100)]
        public string TeamName { get; set; } 

        [Required]
        [MaxLength(100)]
        public string CoachName { get; set; }
    }
}