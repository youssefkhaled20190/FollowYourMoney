using AutoMapper;
using DAL.Model;
using Microsoft.AspNetCore.Identity;
using Shared.DTO;

namespace BLL.Profiles
{
    public class AppMappingProfiles : Profile
    {
        public AppMappingProfiles()
        {
            // ─── User Mappings ──────────────────────────────────────
            CreateMap<User, UserDto>()
                .ForMember(d => d.UserId, o => o.MapFrom(s => s.Id));

            CreateMap<NewUserDto, User>()
                .ForMember(d => d.Id, o => o.MapFrom(s => s.UserId));

            CreateMap<EditUserDto, User>()
                .ForMember(d => d.Id, o => o.MapFrom(s => s.UserId));

            CreateMap<IdentityRole, RoleDto>()
                .ForMember(d => d.RoleId, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.RoleName, o => o.MapFrom(s => s.Name));

            // ─── Gameya Mappings ────────────────────────────────────
            CreateMap<Gameya, GameyaDto>().ReverseMap();

            CreateMap<Gameya, GameyaDetailDto>().ReverseMap();

            CreateMap<GameyaPayment, GameyaPaymentDto>()
                .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.ToString()));

            CreateMap<GameyaPaymentDto, GameyaPayment>()
                .ForMember(d => d.Type, o => o.MapFrom(s => Enum.Parse<DAL.Enums.PaymentType>(s.Type, true)));

            // ─── Installment Mappings ───────────────────────────────
            CreateMap<Installment, InstallmentDto>().ReverseMap();

            // ─── MonthlySnapshot Mappings ───────────────────────────
            CreateMap<MonthlySnapshot, MonthlySnapshotDto>()
                .ForMember(d => d.WeeklyBudgets, o => o.Ignore())   // filled manually by service
                .ForMember(d => d.WishlistSummary, o => o.Ignore()) // filled manually by service
                .ForMember(d => d.Gameyas, o => o.Ignore())
                .ForMember(d => d.Installments, o => o.Ignore());
            CreateMap<MonthlySnapshotDto, MonthlySnapshot>()
                .ForMember(d => d.WeeklyBudgets, o => o.Ignore())
                .ForMember(d => d.Triggers, o => o.Ignore());

            // ─── WeeklyBudget Mappings ──────────────────────────────
            CreateMap<WeeklyBudget, WeeklyBudgetDto>()
                .ForMember(d => d.SpentAmount, o => o.Ignore());     // computed from Expenses list
            CreateMap<WeeklyBudgetDto, WeeklyBudget>()
                .ForMember(d => d.Snapshot, o => o.Ignore())
                .ForMember(d => d.Expenses, o => o.Ignore());

            // ─── WishlistItem Mappings ──────────────────────────────
            CreateMap<WishlistItem, WishlistItemDto>()
                .ForMember(d => d.EtaDays, o => o.Ignore())          // computed by service
                .ForMember(d => d.EtaLabel, o => o.Ignore())         // computed by service
                .ForMember(d => d.Remaining, o => o.Ignore());       // computed by service
            CreateMap<WishlistItemDto, WishlistItem>();
        }
    }
}
