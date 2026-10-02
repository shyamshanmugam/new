CREATE TABLE app_users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_subject TEXT UNIQUE,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farms (
    farm_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    location_label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fields (
    field_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farm_id BIGINT NOT NULL REFERENCES farms(farm_id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    area_hectares NUMERIC(12, 4) CHECK (area_hectares IS NULL OR area_hectares >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE soil_samples (
    sample_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    field_id BIGINT NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    sampled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    laboratory_name TEXT,
    test_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE soil_parameters (
    sample_id BIGINT PRIMARY KEY REFERENCES soil_samples(sample_id) ON DELETE CASCADE,
    nitrogen_mg_kg NUMERIC(12, 4) NOT NULL CHECK (nitrogen_mg_kg >= 0),
    phosphorus_mg_kg NUMERIC(12, 4) NOT NULL CHECK (phosphorus_mg_kg >= 0),
    potassium_mg_kg NUMERIC(12, 4) NOT NULL CHECK (potassium_mg_kg >= 0),
    ph NUMERIC(4, 2) NOT NULL CHECK (ph BETWEEN 0 AND 14),
    moisture_percent NUMERIC(6, 3) NOT NULL CHECK (moisture_percent BETWEEN 0 AND 100),
    organic_matter_percent NUMERIC(6, 3) NOT NULL CHECK (organic_matter_percent BETWEEN 0 AND 100)
);

CREATE TABLE soil_analyses (
    analysis_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sample_id BIGINT NOT NULL UNIQUE REFERENCES soil_samples(sample_id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    grade TEXT NOT NULL CHECK (grade IN ('Good', 'Fair', 'Needs improvement', 'Poor')),
    scoring_method_version TEXT NOT NULL,
    image_class TEXT,
    image_model_confidence NUMERIC(7, 6) CHECK (
        image_model_confidence IS NULL OR image_model_confidence BETWEEN 0 AND 1
    ),
    structured_model_label TEXT,
    structured_model_confidence NUMERIC(7, 6) CHECK (
        structured_model_confidence IS NULL OR structured_model_confidence BETWEEN 0 AND 1
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analysis_recommendations (
    recommendation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    analysis_id BIGINT NOT NULL REFERENCES soil_analyses(analysis_id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    title TEXT NOT NULL,
    guidance TEXT NOT NULL,
    caution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crop_suitability (
    analysis_id BIGINT NOT NULL REFERENCES soil_analyses(analysis_id) ON DELETE CASCADE,
    rank INTEGER NOT NULL CHECK (rank > 0),
    crop_name TEXT NOT NULL,
    compatibility_score NUMERIC(5, 2) NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
    suitability_label TEXT NOT NULL,
    limiting_factors TEXT,
    PRIMARY KEY (analysis_id, rank),
    UNIQUE (analysis_id, crop_name)
);

CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_fields_farm_id ON fields(farm_id);
CREATE INDEX idx_samples_field_sampled_at ON soil_samples(field_id, sampled_at DESC);
CREATE INDEX idx_analyses_created_at ON soil_analyses(created_at DESC);
