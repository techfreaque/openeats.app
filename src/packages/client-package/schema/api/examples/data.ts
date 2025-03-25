import type {
  CategoryUpdateType,
  OrderUpdateType,
} from "@/client-package/types/types";
import {
  type AddressCreateType,
  type CartItemUpdateType,
  type DriverCreateType,
  type OrderCreateType,
} from "@/client-package/types/types";
import type { ExamplesList } from "@/next-portal/api/endpoint";
import { UserRoleValue } from "@/next-portal/types/enums";

import type {
  AdminRegisterType,
  MenuItemCreateType,
  ResetPasswordConfirmType,
  ResetPasswordRequestType,
  RestaurantCreateType,
} from "../../schemas";

class Examples {
  // Test data collections for seeding the database and the api explorer
  private userExamples: ExamplesList<AdminRegisterType> = {
    default: {
      id: "88111873-5dc8-4c4b-93ff-82c2377f5f08",
      firstName: "Customer",
      lastName: "User",
      imageUrl: null,
      email: `customer${Math.random()}@example.com`,
      password: "password",
      confirmPassword: "password",
      userRoles: [{ role: UserRoleValue.CUSTOMER }],
    },
    customer: {
      id: "88111873-5dc8-4c4b-93ff-82c2377f5f02",
      firstName: "Customer",
      lastName: "User",
      imageUrl: null,
      email: "customer@example.com",
      password: "password",
      confirmPassword: "password",
      userRoles: [{ role: UserRoleValue.CUSTOMER }],
    },
    restaurantAdmin: {
      id: "b2f74947-41dc-4e67-995d-97de70f8644e",
      firstName: "Restaurant",
      lastName: "Owner",
      imageUrl: null,
      email: "restaurant@example.com",
      password: "password",
      confirmPassword: "password",
      userRoles: [{ role: UserRoleValue.CUSTOMER }],
    },
    restaurantEmployee: {
      id: "0ad1148e-6114-4194-a51c-dc991ae0fb0e",
      firstName: "Restaurant",
      lastName: "Employee",
      imageUrl: null,
      email: "restaurant.employee@example.com",
      password: "password",
      confirmPassword: "password",
      userRoles: [{ role: UserRoleValue.CUSTOMER }],
    },
    driver: {
      id: "87f23e96-1d90-4d63-98d3-2ad207ad65a7",
      firstName: "Delivery",
      lastName: "Driver",
      imageUrl: null,
      email: "driver@example.com",
      password: "password",
      confirmPassword: "password",
      userRoles: [
        { role: UserRoleValue.CUSTOMER },
        { role: UserRoleValue.DRIVER },
      ],
    },
  };

  private passwordResetConfirmExamples: ExamplesList<ResetPasswordConfirmType> =
    {
      default: {
        id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf013",
        email: this.userExamples.default.email,
        token: "COPY_FROM_EMAIL",
        password: "newpassword",
        confirmPassword: "newpassword",
      },
      example1: {
        id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf011",
        email: this.userExamples.customer.email,
        token: "COPY_FROM_EMAIL",
        password: "newpassword",
        confirmPassword: "newpassword",
      },
    };

  private passwordResetExamples: ExamplesList<ResetPasswordRequestType> = {
    default: {
      id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf687",
      email: this.userExamples.default.email,
    },
    example1: {
      id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf688",
      email: this.userExamples.customer.email,
    },
  };

  private categoryExamples: ExamplesList<CategoryUpdateType> = {
    default: {
      name: "Pizza",
      image: "https://example.com/pizza.jpg",
      id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf669",
    },
    example1: {
      name: "Pizza",
      image: "https://example.com/pizza.jpg",
      id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf665",
    },
    example2: {
      name: "Burgers",
      image: "https://example.com/burgers.jpg",
      id: "f3fd90ec-1471-4ea7-9ffd-5bfad977b364",
    },
  };

  private restaurantExamples: ExamplesList<RestaurantCreateType> = {
    default: {
      id: "a50e2a24-bca7-4a98-aa59-79c6c11c2533",
      name: "Restaurant Test",
      description: "Best pizza in town!",
      image: "https://example.com/pizza-palace.jpg",
      phone: "+1234567890",
      email: `restaurant${Math.random()}@example.com`,
      published: true,
      mainCategoryId: this.categoryExamples.example1.id,
      street: "Antersdorf",
      streetNumber: "38",
      city: "Simbach am Inn",
      zip: "84359",
      countryId: "DE",
      userRoles: [
        {
          userId: this.userExamples.restaurantAdmin.id,
          role: UserRoleValue.RESTAURANT_ADMIN,
        },
      ],
    },
    example1: {
      id: "a50e2a24-bca7-4a98-aa59-79c6c11c2547",
      name: "Da Murauer",
      description: "Best pizza in town!",
      image: "https://example.com/pizza-palace.jpg",
      phone: "+1234567890",
      email: "contact@pizzapalace.com",
      published: true,
      mainCategoryId: this.categoryExamples.example1.id,
      street: "Antersdorf",
      streetNumber: "38",
      city: "Simbach am Inn",
      zip: "84359",
      countryId: "DE",
      userRoles: [
        {
          userId: this.userExamples.restaurantAdmin.id,
          role: UserRoleValue.RESTAURANT_ADMIN,
        },
      ],
    },
    example2: {
      id: "e74ce4c1-418d-4df1-ae06-419c703f61dd",
      name: "Burger Barn",
      description: "Juicy burgers and great fries!",
      image: "https://example.com/burger-barn.jpg",
      phone: "+1234567891",
      email: "contact@burgerbarn.com",
      published: true,
      mainCategoryId: this.categoryExamples.example2.id,
      userRoles: [
        {
          userId: this.userExamples.restaurantAdmin.id,
          role: UserRoleValue.RESTAURANT_ADMIN,
        },
      ],
      street: "Verladestraße",
      streetNumber: "13",
      city: "Braunau am Inn",
      zip: "5280",
      countryId: "AT",
    },
  };

  private menuItemExamples: ExamplesList<MenuItemCreateType> = {
    default: {
      id: "700b99f9-7284-420c-842c-38aaaa59f111",
      name: "Margherita Pizza",
      description: "Classic cheese and tomato pizza",
      price: 9.99,
      image: "https://example.com/margherita.jpg",
      taxPercent: 8.0,
      published: true,
      availableFrom: null,
      availableTo: null,
      isAvailable: true,
      categoryId: this.categoryExamples.default.id,
      restaurantId: this.restaurantExamples.default.id,
    },
    example1: {
      id: "700b99f9-7284-420c-842c-38aaaa59fcbd",
      name: "Margherita Pizza",
      description: "Classic cheese and tomato pizza",
      price: 9.99,
      image: "https://example.com/margherita.jpg",
      taxPercent: 8.0,
      published: true,
      isAvailable: true,
      availableFrom: null,
      availableTo: null,
      categoryId: this.categoryExamples.example1.id,
      restaurantId: this.restaurantExamples.example1.id,
    },
    example2: {
      id: "31e69db7-cfc0-4e6a-bada-2120118c7ad9",
      name: "Blabla Burger",
      description: "with extra rat poison",
      price: 9.99,
      image: "https://example.com/margherita.jpg",
      taxPercent: 10.0,
      published: true,
      isAvailable: true,
      availableFrom: null,
      availableTo: null,
      categoryId: this.categoryExamples.example2.id,
      restaurantId: this.restaurantExamples.example2.id,
    },
  };

  private orderExamples: ExamplesList<OrderCreateType & OrderUpdateType> = {
    default: {
      id: "03820091-b135-4e0b-877e-8a26b4265444",
      restaurantId: this.restaurantExamples.default.id,
      orderItems: [
        {
          menuItemId: this.menuItemExamples.default.id,
          quantity: 2,
          message: "without cheese",
        },
      ],
      customerId: this.userExamples.default.id,
      delivery: {
        street: "789 Beef St",
        streetNumber: "34",
        city: "Foodville",
        zip: "54322",
        countryId: "AT",
        latitude: 40.713,
        longitude: -74.007,
        distance: 3.5,
        estimatedDeliveryTime: 25,
        estimatedPreparationTime: 20,
        message: "ring the doorbell",
        phone: "+1234567890",
        status: "ASSIGNED",
        type: "DELIVERY",
        driverId: this.userExamples.default.id,
      },
      status: "NEW",
      message: "extra ketchup",
      deliveryFee: 2,
      driverTip: 1,
      restaurantTip: 1,
      projectTip: 1,
    },
    example1: {
      id: "03820091-b135-4e0b-877e-8a26b4265274",
      restaurantId: this.restaurantExamples.example1.id,
      orderItems: [
        {
          menuItemId: this.menuItemExamples.example1.id,
          quantity: 2,
          message: "without cheese",
        },
      ],
      customerId: this.userExamples.customer.id,
      delivery: {
        street: "789 Beef St",
        streetNumber: "34",
        city: "Foodville",
        zip: "54322",
        countryId: "AT",
        latitude: 40.713,
        longitude: -74.007,
        distance: 3.5,
        estimatedDeliveryTime: 25,
        estimatedPreparationTime: 20,
        message: "ring the doorbell",
        phone: "+1234567890",
        status: "ASSIGNED",
        type: "DELIVERY",
        driverId: this.userExamples.driver.id,
      },
      status: "NEW",
      message: "extra ketchup",
      deliveryFee: 2,
      driverTip: 1,
      restaurantTip: 1,
      projectTip: 1,
    },
    example2: {
      id: "8d5fef47-2b8e-4187-9554-527e6a524073",
      restaurantId: this.restaurantExamples.example2.id,
      orderItems: [
        {
          menuItemId: this.menuItemExamples.example2.id,
          quantity: 2,
          message: "without cheese",
        },
      ],
      status: "DELIVERED",
      customerId: this.userExamples.customer.id,
      delivery: {
        street: null,
        streetNumber: null,
        city: null,
        zip: null,
        countryId: null,
        latitude: null,
        longitude: null,
        distance: null,
        estimatedDeliveryTime: null,
        estimatedPreparationTime: 20,
        message: "Hello",
        phone: "+1234567890",
        status: "ASSIGNED",
        type: "PICKUP",
        driverId: null,
      },
      message: "ring the doorbell",
      deliveryFee: 2,
      driverTip: 1,
      restaurantTip: 1,
      projectTip: 1,
    },
  };

  private driverExamples: ExamplesList<DriverCreateType> = {
    default: {
      id: "edf5063b-e4f3-4571-a3ea-63062d82ff33",
      userId: this.userExamples.default.id,
      vehicle: "Toyota Corolla",
      licensePlate: "ABC-123",
      city: "Simbach am Inn",
      street: "Bachstrasse",
      streetNumber: "1",
      zip: "84359",
      countryId: "AT",
      radius: 10,
    },
    example1: {
      id: "edf5063b-e4f3-4571-a3ea-63062d82ff1f",
      userId: this.userExamples.driver.id,
      vehicle: "Toyota Corolla",
      licensePlate: "ABC-123",
      city: "Simbach am Inn",
      street: "Bachstrasse",
      streetNumber: "1",
      zip: "84359",
      countryId: "AT",
      radius: 10,
    },
  };

  private addressExamples: ExamplesList<AddressCreateType> = {
    default: {
      id: "01f197a3-43f9-4767-a25f-e60290711133",
      userId: this.userExamples.default.id,
      message: "Ring the doorbell",
      name: "John Smith",
      label: "Home",
      isDefault: false,
      city: "Simbach am Inn",
      street: "Bachstrasse",
      streetNumber: "1",
      zip: "84359",
      countryId: "AT",
      phone: "+1234567890",
    },
    example1: {
      id: "01f197a3-43f9-4767-a25f-e6029071166d",
      userId: this.userExamples.customer.id,
      message: "Ring the doorbell",
      name: "John Smith",
      label: "Home",
      isDefault: false,
      city: "Simbach am Inn",
      street: "Bachstrasse",
      streetNumber: "1",
      zip: "84359",
      countryId: "AT",
      phone: "+1234567890",
    },
    example2: {
      id: "537c1e1f-b5da-4003-a4c9-f07fa10a7ce6",
      userId: this.userExamples.customer.id,
      label: "mommie",
      name: "John Smith",
      message: null,
      isDefault: false,
      city: "Simbach am Inn",
      street: "Bachstrasse",
      streetNumber: "1",
      zip: "84359",
      countryId: "AT",
      phone: "+1234567890",
    },
  };

  private cartExamples: ExamplesList<CartItemUpdateType> = {
    default: {
      id: "a47916a4-2588-40a0-8146-94b090cf4299",
      menuItemId: this.menuItemExamples.default.id,
      restaurantId: this.restaurantExamples.default.id,
      quantity: 2,
      userId: this.userExamples.default.id,
    },
    example1: {
      id: "a47916a4-2588-40a0-8146-94b090cf42d2",
      menuItemId: this.menuItemExamples.example1.id,
      restaurantId: this.restaurantExamples.example1.id,
      quantity: 2,
      userId: this.userExamples.customer.id,
    },
  };

  // Test data for database seeding
  get testData(): {
    userExamples: ExamplesList<AdminRegisterType>;
    restaurantExamples: ExamplesList<RestaurantCreateType>;
    categoryExamples: ExamplesList<CategoryUpdateType>;
    menuItemExamples: ExamplesList<MenuItemCreateType>;
    orderExamples: ExamplesList<OrderCreateType & OrderUpdateType>;
    driverExamples: ExamplesList<DriverCreateType>;
    addressExamples: ExamplesList<AddressCreateType>;
    cartExamples: ExamplesList<CartItemUpdateType>;
    passwordResetExamples: ExamplesList<ResetPasswordRequestType>;
    passwordResetConfirmExamples: ExamplesList<ResetPasswordConfirmType>;
  } {
    return {
      userExamples: this.userExamples,
      restaurantExamples: this.restaurantExamples,
      menuItemExamples: this.menuItemExamples,
      orderExamples: this.orderExamples,
      driverExamples: this.driverExamples,
      addressExamples: this.addressExamples,
      cartExamples: this.cartExamples,
      categoryExamples: this.categoryExamples,
      passwordResetExamples: this.passwordResetExamples,
      passwordResetConfirmExamples: this.passwordResetConfirmExamples,
    };
  }
}

// Create and export a singleton instance
export const examples = new Examples();
