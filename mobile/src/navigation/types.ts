export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: { continueStoryId?: string };
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Kwibuka: undefined;
  Testimonies: undefined;
  TestimonyDetail: { id: string };
  IntlDays: undefined;
  Videos: undefined;
  Contribute: undefined;
  Saved: undefined;
  History: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Listen: undefined;
  Collections: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
