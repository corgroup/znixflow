CREATE TABLE IF NOT EXISTS organizations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS brands (
  organization_id CHAR(36) NOT NULL,
  id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS environments (
  organization_id CHAR(36) NOT NULL,
  brand_id CHAR(36) NOT NULL,
  id CHAR(36) NOT NULL,
  name ENUM('local','development','staging','production') NOT NULL,
  PRIMARY KEY (organization_id, brand_id, id),
  UNIQUE KEY environment_name (organization_id, brand_id, name),
  FOREIGN KEY (organization_id, brand_id) REFERENCES brands(organization_id, id)
);
