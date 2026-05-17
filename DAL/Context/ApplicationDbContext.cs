using DAL.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace DAL.Context
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public DbSet<MonthlySnapshot> MonthlySnapshots => Set<MonthlySnapshot>();
        public DbSet<SnapshotTrigger> SnapshotTriggers => Set<SnapshotTrigger>();
        public DbSet<Gameya> Gameyas => Set<Gameya>();
        public DbSet<GameyaPayment> GameyaPayments => Set<GameyaPayment>();
        public DbSet<Installment> Installments => Set<Installment>();
        public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
        public DbSet<WeeklyBudget> WeeklyBudgets => Set<WeeklyBudget>();
        public DbSet<Expense> Expenses => Set<Expense>();
        public DbSet<Logs> Logs => Set<Logs>();

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<IdentityRole>().HasData(
                new IdentityRole
                {
                    Id = "1",
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                }
            );
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = "b7e10136-59d9-4908-8546-264213377dd9",
                    UserName = "admin",
                    Email = "admin@MoneyFollow.com",
                    NormalizedUserName = "ADMIN",
                    NormalizedEmail = "ADMIN@MONEYFOLLOW.COM",
                    PasswordHash = "AQAAAAIAAYagAAAAEPFctG6LS8KiYEVdI0doV499jipmFK/3jNgFVjDcPHTor8FuU9BswnPGKzXHt2gLaA==", // This!s123
                    NewUser = false,
                    FullName = "Admin"
                }
            );

            modelBuilder.Entity<IdentityUserRole<string>>().HasData(
                new IdentityUserRole<string>
                {
                    UserId = "b7e10136-59d9-4908-8546-264213377dd9",
                    RoleId = "1"
                }
            );
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                var table = StoreObjectIdentifier.Table(entity.GetTableName()!, entity.GetSchema());

                foreach (var property in entity.GetProperties())
                {
                    var name = property.Name;
                    var prefix = "fld"; // default for regular properties

                    // Primary key check
                    if (property.IsPrimaryKey())
                    {
                        prefix = "pk";
                    }
                    // Foreign key check
                    else if (property.IsForeignKey())
                    {
                        prefix = "fk";
                    }

                    property.SetColumnName(prefix + name);
                }
            }
            // MonthlySnapshot
            modelBuilder.Entity<MonthlySnapshot>(e =>
            {
                e.HasKey(x => x.SnapshotId);
                e.Property(x => x.Salary).HasColumnType("decimal(18,2)");
                e.Property(x => x.Bonuses).HasColumnType("decimal(18,2)");
                e.Property(x => x.CarryOver).HasColumnType("decimal(18,2)");
                e.Property(x => x.TotalCommitments).HasColumnType("decimal(18,2)");
                e.Property(x => x.FreeCash).HasColumnType("decimal(18,2)");
                e.Property(x => x.AllocatedToWishlist).HasColumnType("decimal(18,2)");
                e.Property(x => x.WeeklyBudget).HasColumnType("decimal(18,2)");

                // TotalIncome computed — مش بيتحفظ في الـ DB
                e.Ignore(x => x.TotalIncome);

                // index عشان نجيب آخر snapshot للـ user بسرعة
                e.HasIndex(x => new { x.UserId, x.Year, x.Month });
            });

            // SnapshotTrigger
            modelBuilder.Entity<SnapshotTrigger>(e =>
            {
                e.HasKey(x => x.TriggerId);
                e.Property(x => x.CashInHand).HasColumnType("decimal(18,2)");
                e.Property(x => x.TriggerType).HasConversion<string>(); // بيتحفظ كـ string مش int
                e.HasOne(x => x.Snapshot)
                 .WithMany(x => x.Triggers)
                 .HasForeignKey(x => x.SnapshotId);
            });

            // Gameya
            modelBuilder.Entity<Gameya>(e =>
            {
                e.HasKey(x => x.GameyaId);
                e.Property(x => x.MonthlyContribution).HasColumnType("decimal(18,2)");
                e.HasIndex(x => x.UserId);
            });

            // GameyaPayment
            modelBuilder.Entity<GameyaPayment>(e =>
            {
                e.HasKey(x => x.PaymentId);
                e.Property(x => x.Type).HasConversion<string>();
                e.HasOne(x => x.Gameya)
                 .WithMany(x => x.Payments)
                 .HasForeignKey(x => x.GameyaId);
            });

            // Installment
            modelBuilder.Entity<Installment>(e =>
            {
                e.HasKey(x => x.InstallmentId);
                e.Property(x => x.MonthlyAmount).HasColumnType("decimal(18,2)");
                e.Ignore(x => x.RemainingMonths);
                e.Ignore(x => x.IsCompleted);
                e.HasIndex(x => x.UserId);
            });

            // WishlistItem
            modelBuilder.Entity<WishlistItem>(e =>
            {
                e.HasKey(x => x.ItemId);
                e.Property(x => x.TargetAmount).HasColumnType("decimal(18,2)");
                e.Property(x => x.SavedAmount).HasColumnType("decimal(18,2)");
                e.Ignore(x => x.Remaining);
                e.HasIndex(x => new { x.UserId, x.Priority });
            });

            // WeeklyBudget
            modelBuilder.Entity<WeeklyBudget>(e =>
            {
                e.HasKey(x => x.WeekBudgetId);
                e.Property(x => x.BudgetAmount).HasColumnType("decimal(18,2)");
                e.HasOne(x => x.Snapshot)
                 .WithMany(x => x.WeeklyBudgets)
                 .HasForeignKey(x => x.SnapshotId);
            });

            // Expense
            modelBuilder.Entity<Expense>(e =>
            {
                e.HasKey(x => x.ExpenseId);
                e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
                e.HasOne(x => x.WeeklyBudget)
                 .WithMany(x => x.Expenses)
                 .HasForeignKey(x => x.WeekBudgetId);
                e.HasIndex(x => new { x.UserId, x.ExpenseDate });
            });


        }
    }
}
