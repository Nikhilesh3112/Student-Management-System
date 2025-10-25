package com.studentmanagement.model;

public enum Course {
    CS("Computer Science"),
    IT("Information Technology"),
    ECE("Electronics and Communication"),
    EEE("Electrical and Electronics"),
    MECH("Mechanical"),
    CIVIL("Civil");

    private final String displayName;

    Course(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
