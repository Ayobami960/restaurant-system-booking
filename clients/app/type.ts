export type roles = "ADMIN" | "MANAGER" | "STAFF" | "KITCHEN" | "CUSTOMER";

export interface categoryProps {
  id: string;
  name: string;
}

export interface PaginatedResponseProps<T> {
  data: T[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface itemsProps {
  id: string;
  name: string;
  description?: any[];
  price: number;
  categoryId: string;
  isAvailable: boolean;
  image?: string;
  category: categoryProps;
  discount: number;
  recipe?: string;
  averageRating?: number;
  totalReviews?: number;
  aiSuggestion?: string;
}

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned?: boolean;
  image?: string;
};

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

export type TablesProps = {
  id: string;
  name: string;
  seats: number;
  section: string;
  shape: "square" | "circle" | "rectangle";
  status: TableStatus;
  orders: [];
  reservations: [];
};

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE";
export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface OrderItem extends itemsProps {
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  user: User;
  items: {
    id: string;
    orderId: string;
    menuItem: OrderItem;
    menuItemId: string;
    quantity: number;
    price: number;
    notes: string | null;
  }[];
}

export interface Reservation {
  id: string;
  customerName: string;
  customerContact: string;
  reservationTime: string;
  numberOfGuests: number;
  tableId: string;
  status: ReservationStatus;
  date: Date;
  guests: number;
  table: TablesProps;
}

export interface ActivitiesLog {
  id: string;
  details?: string;
  activity: string;
  createdAt: string;
}
