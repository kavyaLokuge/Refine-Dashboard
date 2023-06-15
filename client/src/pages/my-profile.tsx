import { useGetIdentity, useOne } from "@pankod/refine-core";

import { Profile } from "components";

const MyProfile = () => {
  const { data: user } = useGetIdentity();
  const { data, isLoading, isError } = useOne({ // petición get a '/api/v1/users' con el método findOne que requiere un id como parametro 
    resource: "users",
    id: user?.userid,
  });

  const myProfile = data?.data ?? [];

  if (isLoading) return <div>loading...</div>;
  if (isError) return <div>error...</div>;

  return (
    <Profile
      type="My"
      name={myProfile.name}
      email={myProfile.email}
      avatar={myProfile.avatar}
      properties={myProfile.allProperties}
    />
  );
};

export default MyProfile;