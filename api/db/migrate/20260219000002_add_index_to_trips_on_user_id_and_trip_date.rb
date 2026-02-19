class AddIndexToTripsOnUserIdAndTripDate < ActiveRecord::Migration[8.1]
  def change
    add_index :trips, [:user_id, :trip_date]
  end
end
