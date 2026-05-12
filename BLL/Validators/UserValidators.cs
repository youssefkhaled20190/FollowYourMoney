using FluentValidation;
using Shared.DTO;

namespace BLL.Validators
{
    public class UserValidators : AbstractValidator<UserDto>
    {
        public UserValidators()
        {
            //Rules for add operation
            RuleSet("Add", () =>
            {
                

            });

            //Rules for update operation
            RuleSet("Update", () =>
            {
                
            });


        }
    }
}
