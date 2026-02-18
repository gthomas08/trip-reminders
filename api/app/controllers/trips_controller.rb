class TripsController < ApplicationController
  before_action :set_trip, only: [:show, :destroy]

  # GET /trips
  def index
    @trips = Trip.all.order(trip_date: :asc)
    render json: @trips
  end

  # GET /trips/:id
  def show
    render json: @trip
  end

  # POST /trips
  def create
    @trip = Trip.new(trip_params)

    if @trip.save
      render json: @trip, status: :created
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
    @trip = Trip.find(params[:id])
  end

  def trip_params
    params.require(:trip).permit(:destination, :trip_date, :notes)
  end
end
