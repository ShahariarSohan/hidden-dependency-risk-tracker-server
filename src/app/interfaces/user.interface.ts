export interface IEmployee {
  id?: string;
  password: string;
  name: string;
  email: string;
  contactNumber: string;
  teamId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IManager {
  id?: string;
  password: string;
  name: string;
  email: string;
  contactNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}
