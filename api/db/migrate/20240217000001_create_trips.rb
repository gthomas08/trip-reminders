class CreateTrips < ActiveRecord::Migration[8.1]
  def change
    create_table :trips do |t|
      t.string :destination, null: false
      t.date :trip_date, null: false
      t.text :notes

      t.timestamps
    end
  end
end
