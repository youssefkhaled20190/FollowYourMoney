using BLL.Mapping;
using DAL.Interfaces;
using DAL.Model;
using Shared.DTO;
using System.Text.Json;

namespace BLL.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;
        private readonly ILogsRepository _logs;
        public UserService(IUserRepository repository, ILogsRepository logs) 
        {
            _repository = repository;
            _logs = logs;
        }

        // --- Create User ---
        public async Task<UserDto?> CreateAsync(NewUserDto dto,string createdBy)
        {
            await using var transaction = await this._repository.GenerateTransaction();
            try
            {
                if (int.Parse(dto.UserCode) <= 0)
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("Employee code must be positive number.");
                }

                dto.UserName = "GS" + dto.UserCode;
                if (await _repository.IsUserNameTakenAsync(dto.UserName))
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("Username already exists.");
                }

                var roleName = await _repository.ResolveRoleNameByIdAsync(dto.RoleId);
                if (roleName == null || roleName == "IT Admin")
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("The role is not exists.");
                }

                var entity = ManualMapper.MapBase<NewUserDto, User>(dto);
                if (entity == null)
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("User data corrapted.");
                }

                entity.NewUser = true;
                entity.IsActive = true;

                var createdUser = await _repository.CreateAsync(entity, dto.Password, roleName);
                if (createdUser == null)
                {
                    await transaction.RollbackAsync();
                    return null;
                }

                var result = ManualMapper.MapBase<User, UserDto>(createdUser);

                await _logs.AddAsync(new Logs
                {
                    UserId = createdBy,
                    ObjectId =createdUser.Id,
                    ObjectType = "User",
                    Action = LogActionEnum.CREATE,
                });
                await transaction.CommitAsync();
                return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // --- Get All Users ---
        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var filteredUserEntities = await _repository.GetAllAsync();

            var dto = ManualMapper.MapList<User, UserDto>(filteredUserEntities);
            return dto;
        }

        // --- Get By Id ---
        public async Task<UserDto?> GetByIdAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;

            var dto = ManualMapper.MapBase<User, UserDto>(entity);
            return dto;
        }

        // --- Update User ---
        public async Task<UserDto?> UpdateAsync(EditUserDto dto, string updatedBy)
        {
            await using var transaction = await this._repository.GenerateTransaction();
            try
            {
                var user = await _repository.GetByIdAsync(dto.UserId!);
                if (user == null)
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("User does not exist.");
                }
                var OldStateJson = JsonSerializer.Serialize(user);

                if (int.Parse(dto.UserCode) <= 0)
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("Employee code must be positive number.");
                }

                if (string.IsNullOrWhiteSpace(dto.Email))
                    dto.Email = string.Empty;

                dto.UserName = "GS" + dto.UserCode;
                if (await _repository.IsUserNameTakenAsync(dto.UserName, dto.UserId))
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("Username already exists.");
                }

                var roleName = await _repository.ResolveRoleNameByIdAsync(dto.RoleId);
                if (roleName == null || roleName == "IT Admin")
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("The role is not exists.");
                }

                user = ManualMapper.MapBase < EditUserDto, User >(dto);
                if (user == null)
                {
                    await transaction.RollbackAsync();
                    throw new ArgumentException("User data corrapted.");
                }

                var updatedUser = await _repository.UpdateAsync(user, roleName, dto.Password);
                if (updatedUser == null)
                {
                    await transaction.RollbackAsync();
                    return null;
                }

                var result = ManualMapper.MapBase<User, UserDto>(updatedUser);
                await _logs.AddAsync(new Logs
                {
                    UserId = updatedBy,
                    ObjectId =updatedUser.Id,
                    ObjectType = "User",
                    Action = LogActionEnum.UPDATE,
                    OldStateJson = OldStateJson
                });
                await transaction.CommitAsync();
                return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // --- Change User Status ---
        public async Task<bool> UpdateStatusUserAsync(string id, bool isAvailable, string updatedBy)
        {
            await using var transaction = await this._repository.GenerateTransaction();
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                var currentUserRole = await _repository.GetRoleAsync(entity);

                if (currentUserRole == "IT Admin")
                {
                    await transaction.RollbackAsync();
                    return false;
                }
                var updated = await _repository.UpdateStatusUserAsync(entity, isAvailable);
                await _logs.AddAsync(new Logs
                {
                    UserId = updatedBy,
                    ObjectId = entity.Id,
                    ObjectType = "User",
                    Action = LogActionEnum.CHANGE_STATE,
                });
                await transaction.CommitAsync();
                return updated;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string UserId, string DeletedById)
        {
            await using var transaction = await this._repository.GenerateTransaction();
            try
            {
                await _logs.AddAsync(new Logs
                {
                    UserId = DeletedById,
                    ObjectId = UserId,
                    ObjectType = "User",
                    Action = LogActionEnum.DELETE,
                });
                var result = await _repository.DeleteAsync(UserId, DeletedById);
                await transaction.CommitAsync();
                return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<Shared.DTO.RoleDto>> GetAllRoleAsync()
        {
            var roles = await _repository.GetAllRoleAsync();
            var dto = ManualMapper.MapList<Microsoft.AspNetCore.Identity.IdentityRole, Shared.DTO.RoleDto>(roles);
            return dto;
        }
    }
}
