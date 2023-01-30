﻿using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class Store
          : Entity, IUserActionTracker
    {
        public string Name { get; set; }
        public int PaymentMethodId { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public int? DeletedById { get; set; }
        public virtual UserAccount DeletedBy { get; set; }
        public int? UpdatedById { get; set; }
        public virtual UserAccount UpdatedBy { get; set; }
        public int? CreatedById { get; set; }
        public virtual UserAccount CreatedBy { get; set; }
        public int? DeactivatedById { get; set; }
        public virtual UserAccount DeactivatedBy { get; set; }
    }
}