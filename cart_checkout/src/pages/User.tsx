import { useAuthContext } from '../my-context';

const User = () => {

  const context = useAuthContext();

  return (
    <div>User ID is: {context.auth.uid}</div>
  );
};
export default User;