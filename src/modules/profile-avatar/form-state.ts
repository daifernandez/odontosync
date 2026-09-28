export type ProfileAvatarFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const profileAvatarFormState: ProfileAvatarFormState = {
  status: "idle",
  message: "",
};
