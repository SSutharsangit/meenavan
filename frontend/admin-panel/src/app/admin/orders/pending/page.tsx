import OrdersManagement from "../_utils/components/OrdersManagement";

export default function PendingOrdersPage() {
  return (
    <OrdersManagement 
      defaultStatus="pending" 
      title="Pending Orders" 
      subtitle="View and process all new incoming orders." 
    />
  );
}
