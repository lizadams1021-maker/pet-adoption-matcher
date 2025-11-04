ALTER TABLE pets
ADD COLUMN state TEXT NULL,
ADD COLUMN adoptable_out_of_state BOOLEAN DEFAULT FALSE,
ADD COLUMN only_pet BOOLEAN DEFAULT FALSE,
ADD COLUMN ok_with_animals TEXT[] NULL,
ADD COLUMN requires_fenced_yard BOOLEAN DEFAULT FALSE,
ADD COLUMN needs_company BOOLEAN DEFAULT FALSE,
ADD COLUMN comfortable_hours_alone TEXT NULL,
ADD COLUMN ok_with_children BOOLEAN DEFAULT FALSE,
ADD COLUMN ok_with_children_ages TEXT[] NULL,
ADD COLUMN owner_experience_required TEXT NULL;
