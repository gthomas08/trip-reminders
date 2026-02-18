class AddTravelerTypeToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :traveler_type, :string
  end
end
