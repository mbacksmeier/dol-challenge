class Address < ActiveRecord::Base
  belongs_to :company

  validates_presence_of :street, :city, :state, :zip, :latitude, :longitude
  validates_inclusion_of :zip, :in => 10000..99999
  validates_length_of :state, :is => 2

  attr_accessible :street, :city, :state, :zip, :latitude, :longitude

  geocoded_by :full_street_address
  before_validation :geocode

  def full_street_address
    [street, city, state, 'US'].compact.join(', ')
  end

end
