Feature: Package: Remove default generator for products dependency on cpm-modules generator
  As a developer
  I can scaffold modules automatically
  So that I can efficiently and reliably setup a new module

  Scenario: Generate a default module
    
    Given a new folder with an existing package.json
    When calling the generator
    Then the expected folder structure and files are generated
    