import OrdersManagement from "../_utils/components/OrdersManagement";

export default function CompletedOrdersPage() {
  return (
    <OrdersManagement 
      defaultStatus="delivered" 
      title="Completed Orders" 
      subtitle="View all successfully delivered orders." 
    />
  );
}
