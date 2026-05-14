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

            CreateMap<Gameya, GameyaDetailDto>();

            CreateMap<GameyaPayment, GameyaPaymentDto>()
                .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.ToString()));

            CreateMap<GameyaPaymentDto, GameyaPayment>()
                .ForMember(d => d.Type, o => o.MapFrom(s => Enum.Parse<DAL.Enums.PaymentType>(s.Type, true)));

            // ─── Installment Mappings ────────────────────────────────────
            CreateMap<Installment, InstallmentDto>().ReverseMap();

        }
    }
}
