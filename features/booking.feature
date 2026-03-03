Feature: Booking

  Scenario: Successful booking
    Given I am on the booking page
    When I fill out the booking form
    And I submit the form
    Then I should see a confirmation message

  Scenario: Failed booking
    Given I am on the booking page
    When I fill out the booking form with invalid data
    And I submit the form
    Then I should see an error message