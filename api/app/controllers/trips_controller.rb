class TripsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_trip, only: [:show, :update, :destroy]

  # GET /trips
  def index
    @trips = current_user.trips.order(
      Arel.sql(
        "CASE WHEN trip_date >= CURRENT_DATE THEN 0 ELSE 1 END ASC, " \
        "CASE WHEN trip_date >= CURRENT_DATE THEN trip_date END ASC, " \
        "trip_date DESC"
      )
    )
    render json: @trips
  end

  # GET /trips/:id
  def show
    render json: @trip
  end

  # POST /trips
  def create
    @trip = current_user.trips.build(trip_params)

    if @trip.save
      render json: @trip, status: :created
    else
      render json: { errors: @trip.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /trips/:id
  def update
    if @trip.update(trip_params)
      render json: @trip
    else
      render json: { errors: @trip.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /trips/:id
  def destroy
    @trip.destroy
    head :no_content
  end

  private

  def set_trip
    @trip = current_user.trips.find(params[:id])
  end

  def trip_params
    params.require(:trip).permit(:destination, :trip_date, :notes)
  end
end
