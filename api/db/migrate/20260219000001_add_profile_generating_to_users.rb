class AddProfileGeneratingToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :profile_generating, :boolean, null: false, default: false
  end
end
