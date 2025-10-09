using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TrainingProgram.Api.Models;

namespace TrainingProgram.Api.Dtos
{
    public class CreateActivityDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [Required]
        [Range(1, 600)] // max 600 minutes = 10 hours
        public int DurationMinutes { get; set; }
        [Required]
        public ActivityCategory Category { get; set; }
        [Required]
        public ActivityFormat Format { get; set; }
    }
}