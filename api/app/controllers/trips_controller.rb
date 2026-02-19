class TripsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_trip, only: [:show, :update, :destroy]

  # GET /trips
  def index
    pagy_request = Pagy::Request.new(request: request, limit: Pagy.options[:limit])
    pagy, trips = Pagy::OffsetPaginator.paginate(
      current_user.trips.sorted_by_date,
      request: pagy_request
    )
    render json: {
      trips: trips,
      meta: { count: pagy.count, page: pagy.page, pages: pagy.pages, limit: pagy.limit }
    }
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
